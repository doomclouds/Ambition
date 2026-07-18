#!/usr/bin/env bash
# Package the Codex plugin from a Git commit into deterministic rootless archives.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_PATH="plugins/superpowers-lite"
REPO_ROOT=""

REF="HEAD"
OUTPUT=""
FORMAT=""
ALLOW_DIRTY=0
KEEP_STAGE=0

usage() {
  cat <<'EOF'
用法：
  scripts/package-codex-plugin.sh [选项]

选项：
  --output PATH      输出归档路径。
  --format FORMAT    归档格式：zip 或 tar.gz，默认 zip。
  --ref REF          要打包的 Git 引用，默认 HEAD。
  --allow-dirty      允许工作区存在未提交变更；归档仍只读取 --ref。
  --keep-stage       保留并显示临时暂存目录。
  -h, --help         显示帮助。

默认产物写入 ../_tmp/superpowers-lite-packaging/。归档根层只包含
.codex-plugin/、assets/、skills/、README.md 和 LICENSE。
EOF
}

die() {
  echo "错误：$*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      [[ $# -ge 2 ]] || die "--output 需要路径"
      OUTPUT="$2"
      shift 2
      ;;
    --format)
      [[ $# -ge 2 ]] || die "--format 需要值"
      case "$2" in
        zip) FORMAT="zip" ;;
        tar.gz|tgz) FORMAT="tar.gz" ;;
        *) die "--format 只能是 zip 或 tar.gz" ;;
      esac
      shift 2
      ;;
    --ref)
      [[ $# -ge 2 ]] || die "--ref 需要值"
      REF="$2"
      shift 2
      ;;
    --allow-dirty)
      ALLOW_DIRTY=1
      shift
      ;;
    --keep-stage)
      KEEP_STAGE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "未知参数：$1"
      ;;
  esac
done

infer_format() {
  case "$1" in
    *.tar.gz|*.tgz) printf '%s\n' "tar.gz" ;;
    *.zip) printf '%s\n' "zip" ;;
    *) return 1 ;;
  esac
}

if [[ -z "$FORMAT" ]]; then
  FORMAT="$(infer_format "$OUTPUT" || true)"
  [[ -n "$FORMAT" ]] || FORMAT="zip"
else
  output_format="$(infer_format "$OUTPUT" || true)"
  if [[ -n "$output_format" && "$output_format" != "$FORMAT" ]]; then
    die "输出扩展名与 --format $FORMAT 不匹配：$OUTPUT"
  fi
fi

command -v git >/dev/null || die "PATH 中找不到 git"
command -v tar >/dev/null || die "PATH 中找不到 tar"
command -v python3 >/dev/null || die "PATH 中找不到 python3"
command -v sha256sum >/dev/null || die "PATH 中找不到 sha256sum"

REPO_ROOT="$(git -C "$PLUGIN_ROOT" rev-parse --show-toplevel 2>/dev/null)" ||
  die "无法定位 Git 仓库根目录：$PLUGIN_ROOT"
git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1 ||
  die "不是 Git 工作区：$REPO_ROOT"
git -C "$REPO_ROOT" rev-parse --verify "$REF^{commit}" >/dev/null 2>&1 ||
  die "Git 引用无法解析为提交：$REF"

if [[ "$ALLOW_DIRTY" -ne 1 ]]; then
  dirty_status="$(git -C "$REPO_ROOT" status --porcelain --untracked-files=all)"
  if [[ -n "$dirty_status" ]]; then
    echo "工作区存在未提交变更：" >&2
    printf '%s\n' "$dirty_status" | sed 's/^/  /' >&2
    die "请先提交或暂存变更，或显式传入 --allow-dirty"
  fi
fi

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/superpowers-lite-codex-package.XXXXXX")"
STAGE="$WORK_DIR/payload"
ARCHIVE_LIST="$WORK_DIR/archive-list"
GIT_MODE_MAP="$WORK_DIR/git-mode-map"

cleanup() {
  if [[ "$KEEP_STAGE" -eq 1 ]]; then
    echo "保留暂存目录：$WORK_DIR" >&2
  else
    rm -rf "$WORK_DIR"
  fi
}
trap cleanup EXIT

mkdir -p "$STAGE"

git -C "$REPO_ROOT" archive --format=tar "$REF:$PLUGIN_PATH" -- \
  .codex-plugin LICENSE README.md assets skills |
  tar -xf - -C "$STAGE"

git -C "$REPO_ROOT" ls-tree -r "$REF:$PLUGIN_PATH" -- \
  .codex-plugin LICENSE README.md assets skills |
  awk -F '\t' '{ split($1, fields, " "); print fields[1], $2 }' >"$GIT_MODE_MAP"

VERSION="$(python3 - "$STAGE/.codex-plugin/plugin.json" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as manifest:
    print(json.load(manifest).get("version", ""))
PY
)"
[[ -n "$VERSION" ]] || die "无法读取插件版本"

if [[ -z "$OUTPUT" ]]; then
  case "$FORMAT" in
    zip) OUTPUT="$REPO_ROOT/../_tmp/superpowers-lite-packaging/superpowers-lite-$VERSION.zip" ;;
    tar.gz) OUTPUT="$REPO_ROOT/../_tmp/superpowers-lite-packaging/superpowers-lite-$VERSION.tar.gz" ;;
  esac
fi
mkdir -p "$(dirname "$OUTPUT")"
OUTPUT="$(cd "$(dirname "$OUTPUT")" && pwd)/$(basename "$OUTPUT")"

(
  cd "$STAGE"
  {
    find . -mindepth 1 -type d | sed 's#^\./##' | LC_ALL=C sort
    find . -mindepth 1 -type f | sed 's#^\./##' | LC_ALL=C sort
  } >"$ARCHIVE_LIST"
)

python3 - "$FORMAT" "$STAGE" "$ARCHIVE_LIST" "$OUTPUT" "$GIT_MODE_MAP" <<'PY'
import gzip
import os
import stat
import sys
import tarfile
import zipfile

archive_format, stage, archive_list, output, mode_map_path = sys.argv[1:]

git_modes = {}
with open(mode_map_path, encoding="utf-8") as entries:
    for entry in entries:
        mode, relative_path = entry.rstrip("\n").split(" ", 1)
        git_modes[relative_path] = mode

with open(archive_list, encoding="utf-8") as entries:
    paths = [line.rstrip("\n") for line in entries]

def file_mode(relative_path):
    return 0o755 if git_modes.get(relative_path) == "100755" else 0o644

if archive_format == "zip":
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative_path in paths:
            source_path = os.path.join(stage, relative_path)
            is_directory = os.path.isdir(source_path)
            archive_name = relative_path + ("/" if is_directory else "")
            info = zipfile.ZipInfo(archive_name, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.compress_type = zipfile.ZIP_DEFLATED
            if is_directory:
                info.external_attr = ((stat.S_IFDIR | 0o755) << 16) | 0x10
                payload = b""
            else:
                info.external_attr = (stat.S_IFREG | file_mode(relative_path)) << 16
                with open(source_path, "rb") as source:
                    payload = source.read()
            archive.writestr(info, payload)
elif archive_format == "tar.gz":
    with open(output, "wb") as raw:
        with gzip.GzipFile(filename="", fileobj=raw, mode="wb", mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w", format=tarfile.USTAR_FORMAT) as archive:
                for relative_path in paths:
                    source_path = os.path.join(stage, relative_path)
                    info = archive.gettarinfo(source_path, arcname=relative_path)
                    info.mtime = 0
                    info.uid = 0
                    info.gid = 0
                    info.uname = ""
                    info.gname = ""
                    info.mode = 0o755 if info.isdir() else file_mode(relative_path)
                    if info.isreg():
                        with open(source_path, "rb") as source:
                            archive.addfile(info, source)
                    else:
                        archive.addfile(info)
else:
    raise ValueError(f"不支持的归档格式：{archive_format}")
PY

archive_paths="$(
  case "$FORMAT" in
    zip)
      python3 - "$OUTPUT" <<'PY'
import sys
import zipfile

with zipfile.ZipFile(sys.argv[1]) as archive:
    print("\n".join(archive.namelist()))
PY
      ;;
    tar.gz)
      tar -tzf "$OUTPUT"
      ;;
  esac
)"

unexpected_paths="$(
  printf '%s\n' "$archive_paths" |
    sed 's#/$##' |
    grep -Ev '^(\.codex-plugin($|/)|assets($|/)|skills($|/)|README\.md$|LICENSE$)' || true
)"
if [[ -n "$unexpected_paths" ]]; then
  printf '%s\n' "$unexpected_paths" | sed 's/^/  /' >&2
  die "归档包含白名单之外的路径"
fi

entry_count="$(printf '%s\n' "$archive_paths" | wc -l | tr -d ' ')"
skill_count="$(find "$STAGE/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
checksum="$(sha256sum "$OUTPUT" | awk '{print $1}')"

echo "归档：$OUTPUT"
echo "格式：$FORMAT"
echo "版本：$VERSION"
echo "条目：$entry_count"
echo "技能：$skill_count"
echo "SHA-256: $checksum"
