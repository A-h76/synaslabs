"""Generate Synas favicon/app icons from the approved synas-appicon.png."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
APP = ROOT / "src" / "app"
SOURCE = PUBLIC / "synas-appicon.png"
BG = (11, 11, 11, 255)


def opaque_square(src: Image.Image) -> Image.Image:
    """Composite the (possibly rounded) app icon onto an opaque near-black square."""
    src = src.convert("RGBA")
    canvas = Image.new("RGBA", src.size, BG)
    canvas.alpha_composite(src)
    return canvas


def resize(img: Image.Image, size: int) -> Image.Image:
    return img.resize((size, size), Image.Resampling.LANCZOS)


def save_png(img: Image.Image, path: Path, size: int) -> None:
    out = resize(img, size).convert("RGBA")
    bg = Image.new("RGBA", out.size, BG)
    bg.alpha_composite(out)
    bg.convert("RGB").save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({size}x{size})")


def save_ico(img: Image.Image, path: Path, sizes: list[int]) -> None:
    base = opaque_square(img)
    frames = [resize(base, s).convert("RGBA") for s in sizes]
    frames[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=frames[1:],
    )
    print(f"wrote {path.relative_to(ROOT)} sizes={sizes}")


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"missing source: {SOURCE}")

    master = opaque_square(Image.open(SOURCE))
    print(f"source {SOURCE.name} {master.size}")

    # public/ — direct URLs and legacy references
    save_png(master, PUBLIC / "icon.png", 512)
    save_png(master, PUBLIC / "apple-touch-icon.png", 180)
    save_png(master, PUBLIC / "favicon.png", 48)
    save_png(master, PUBLIC / "favicon-32.png", 32)
    save_png(master, PUBLIC / "synas-favicon.png", 48)
    save_png(master, PUBLIC / "synas-icon-master.png", 512)
    save_ico(master, PUBLIC / "favicon.ico", [16, 32, 48])

    # src/app/ — Next.js App Router metadata file convention
    save_ico(master, APP / "favicon.ico", [16, 32, 48])
    save_png(master, APP / "icon.png", 512)
    save_png(master, APP / "apple-icon.png", 180)


if __name__ == "__main__":
    main()
