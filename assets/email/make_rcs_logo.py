"""Generate RCS email signature banner logo (no brokerage / soft-credit language)."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), "rcs-logo.png")
W, H = 560, 126
COPPER = "#b87333"
COPPER_TEXT = "#c48a4a"
WHITE = "#ffffff"
NAVY = "#0c1222"


def load_font(size, bold=False):
    candidates = []
    if bold:
        candidates += [
            r"C:\Windows\Fonts\arialbd.ttf",
            r"C:\Windows\Fonts\segoeuib.ttf",
            r"C:\Windows\Fonts\timesbd.ttf",
        ]
    candidates += [
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\times.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    img = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(img)

    d.rectangle([0, 0, 8, H], fill=COPPER)

    sq = 78
    sq_x, sq_y = 28, (H - sq) // 2
    d.rectangle([sq_x, sq_y, sq_x + sq, sq_y + sq], fill=COPPER)

    r_font = None
    for path in (
        r"C:\Windows\Fonts\timesbd.ttf",
        r"C:\Windows\Fonts\times.ttf",
        r"C:\Windows\Fonts\georgiab.ttf",
    ):
        if os.path.exists(path):
            r_font = ImageFont.truetype(path, 58)
            break
    if r_font is None:
        r_font = load_font(58, True)

    letter = "R"
    bbox = d.textbbox((0, 0), letter, font=r_font)
    rw, rh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    rx = sq_x + (sq - rw) // 2 - bbox[0]
    ry = sq_y + (sq - rh) // 2 - bbox[1] - 2
    d.text((rx, ry), letter, fill=WHITE, font=r_font)

    name_font = load_font(28, True)
    sub_font = load_font(16, False)
    text_x = sq_x + sq + 18
    name = "Rapid Capital Solutions"
    sub = "Direct Business Capital"

    name_bbox = d.textbbox((0, 0), name, font=name_font)
    sub_bbox = d.textbbox((0, 0), sub, font=sub_font)
    name_h = name_bbox[3] - name_bbox[1]
    gap = 6
    block_h = name_h + gap + (sub_bbox[3] - sub_bbox[1])
    ty = (H - block_h) // 2 - name_bbox[1]
    d.text((text_x, ty), name, fill=WHITE, font=name_font)
    d.text((text_x, ty + name_h + gap), sub, fill=COPPER_TEXT, font=sub_font)

    img.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({os.path.getsize(OUT)} bytes)")


if __name__ == "__main__":
    main()
