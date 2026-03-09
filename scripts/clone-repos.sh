#!/usr/bin/env bash
# ============================================================
# O-PRIMUS — Clone 18 repos avec SPARSE CHECKOUT
# ============================================================
set -euo pipefail
export GIT_TERMINAL_PROMPT=0

LIBRARY_DIR="library/repos"
ROOT_DIR="$(pwd)"
LOG_FILE="${ROOT_DIR}/library/clone.log"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}▶ O-PRIMUS Library Builder — Mode Sparse Checkout${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v git &> /dev/null; then
  echo -e "${RED}✗ git non trouvé.${NC}"; exit 1
fi

AVAILABLE_KB=$(df "$HOME" | tail -1 | awk '{print $4}')
MIN_KB=512000
if (( AVAILABLE_KB < MIN_KB )); then
  echo -e "${RED}✗ Espace insuffisant ($((AVAILABLE_KB/1024)) MB). Minimum 500 MB requis.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Espace disque OK ($((AVAILABLE_KB/1024)) MB disponible)${NC}"

mkdir -p "$LIBRARY_DIR"
touch "$LOG_FILE"

clone_sparse() {
  local REPO_DIR="$1"
  local URL="$2"
  local SPARSE_DIRS="$3"
  local TARGET="${ROOT_DIR}/${LIBRARY_DIR}/${REPO_DIR}"

  if [ -d "$TARGET/.git" ]; then
    echo -e "  ${YELLOW}⟳ Déjà cloné: $REPO_DIR — skip${NC}"
    return 0
  fi

  echo -n "  ⬇  $REPO_DIR (sparse: $SPARSE_DIRS)... "

  if git clone --depth=1 --filter=blob:none --sparse --quiet "$URL" "$TARGET" 2>>"$LOG_FILE"; then
    cd "$TARGET"
    git sparse-checkout set $SPARSE_DIRS 2>>"$LOG_FILE" || true
    cd "${ROOT_DIR}"
    local SIZE
    SIZE=$(du -sh "$TARGET" 2>/dev/null | cut -f1)
    echo -e "${GREEN}✓ ${SIZE}${NC}"
  else
    echo -e "${RED}✗ Échec (voir $LOG_FILE)${NC}"
  fi
}

clone_sparse "theatre-js__theatre"              "https://github.com/theatre-js/theatre"                "src/ packages/"
clone_sparse "framer__motion"                   "https://github.com/framer/motion"                     "packages/framer-motion/src/ packages/motion-dom/src/"
clone_sparse "pmndrs__react-spring"             "https://github.com/pmndrs/react-spring"               "packages/"
clone_sparse "ibelick__motion-primitives"       "https://github.com/ibelick/motion-primitives"         "components/"
clone_sparse "darkroomco__lenis"                "https://github.com/darkroomco/lenis"                  "packages/lenis/src/"
clone_sparse "locomotivemtl__locomotive-scroll" "https://github.com/locomotivemtl/locomotive-scroll"   "src/"
clone_sparse "pmndrs__react-three-fiber"        "https://github.com/pmndrs/react-three-fiber"          "packages/fiber/src/"
clone_sparse "pmndrs__drei"                     "https://github.com/pmndrs/drei"                       "src/"
clone_sparse "pmndrs__postprocessing"           "https://github.com/pmndrs/postprocessing"             "src/"
clone_sparse "pmndrs__react-three-offscreen"    "https://github.com/pmndrs/react-three-offscreen"      "src/"
clone_sparse "shadcn-ui__ui"                    "https://github.com/shadcn-ui/ui"                      "apps/www/registry/"
clone_sparse "radix-ui__primitives"             "https://github.com/radix-ui/primitives"               "packages/"
clone_sparse "emilkowalski_vaul"                "https://github.com/emilkowalski/vaul"                 "src/"
clone_sparse "emilkowalski_sonner"              "https://github.com/emilkowalski/sonner"               "src/"
clone_sparse "split-type__split-type"           "https://github.com/split-type/split-type"             "src/"
clone_sparse "mattboldt__typed.js"              "https://github.com/mattboldt/typed.js"                "src/"
clone_sparse "vercel__commerce"                 "https://github.com/vercel/commerce"                   "components/ lib/"
clone_sparse "leerob__leerob.io"                "https://github.com/leerob/leerob.io"                  "app/ components/"

FINAL_SIZE=$(du -sh "${ROOT_DIR}/${LIBRARY_DIR}" 2>/dev/null | cut -f1)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Clonage sparse terminé${NC}"
echo -e "   Taille totale library/repos : ${FINAL_SIZE}"
