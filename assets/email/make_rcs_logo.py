"""Build email logo from chosen Option D full card (Desktop draft)."""
from PIL import Image
import os, shutil

SRC = r"C:\Users\Vinny\Desktop\RCS-Logo-Options\rcs-logo-opt-d-growing.png"
OUT_DIR = os.path.dirname(__file__)
MAX_W = 560

def main():
    im = Image.open(SRC).convert("RGB")
    ratio = MAX_W / im.size[0]
    im2 = im.resize((MAX_W, int(im.size[1] * ratio)), Image.Resampling.LANCZOS)
    for name in ("rcs-sig-card-d.png", "rcs-logo-growing.png", "rcs-logo.png", "rcs-logo-opt-d-source.png"):
        path = os.path.join(OUT_DIR, name)
        im2.save(path, "PNG", optimize=True)
        print("wrote", path, os.path.getsize(path))

if __name__ == "__main__":
    main()
