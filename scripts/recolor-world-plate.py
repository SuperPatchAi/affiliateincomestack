"""One-off: recolor the World plate to cool neutrals (spec 2026-08-17 super-stack layout).

The slabs must stop reading as the Product/Brand/Income/People stack roles.
Desaturate hard, then apply a cool steel cast that keeps the luminance shape.
"""

from PIL import Image, ImageEnhance

SRC = "public/concepts/clean/sp-stack-02-world.png"

img = Image.open(SRC).convert("RGB")
muted = ImageEnhance.Color(img).enhance(0.18)
r, g, b = muted.split()
r = r.point(lambda v: int(v * 0.82))
g = g.point(lambda v: int(v * 0.97))
b = b.point(lambda v: min(255, int(v * 1.12)))
Image.merge("RGB", (r, g, b)).save(SRC)
print(f"recolored {SRC}")
