from PIL import Image, ImageDraw, ImageFont
import math

SIZE = 1024

def heart_point(t, cx, cy, s):
    x = cx + s * 0.8 * (16 * math.sin(t)**3) / 16
    y = cy - s * 0.8 * (13*math.cos(t) - 5*math.cos(2*t) - 2*math.cos(3*t) - math.cos(4*t)) / 16
    return (x, y)

def make_icon(size, for_adaptive=False):
    img = Image.new('RGB', (size, size), (8, 0, 5))
    draw = ImageDraw.Draw(img)

    # Full square radial gradient background (dark maroon center)
    cx2, cy2 = size // 2, size // 2
    max_r = int(size * 0.72)
    for i in range(max_r, 0, -1):
        ratio = i / max_r
        r = int(62 * ratio + 8 * (1 - ratio))
        g = int(8  * ratio + 0 * (1 - ratio))
        b = int(28 * ratio + 5 * (1 - ratio))
        draw.ellipse([cx2-i, cy2-i, cx2+i, cy2+i], fill=(r, g, b))

    if not for_adaptive:
        # Gold outer ring
        pad = int(size * 0.037)
        draw.ellipse([pad, pad, size-pad, size-pad], outline=(212, 175, 55), width=int(size*0.017))
        draw.ellipse([pad+int(size*0.03), pad+int(size*0.03),
                      size-pad-int(size*0.03), size-pad-int(size*0.03)],
                     outline=(212, 175, 55), width=2)

    # Heart position and size
    cx, cy = size // 2, size // 2 - int(size * 0.03)
    hs = int(size * 0.265)

    # Glow shadow layers under heart
    for off, col in [(16, (140, 80, 8)), (10, (160, 95, 12)), (5, (180, 110, 15))]:
        pts = [heart_point(t*2*math.pi/360, cx, cy+off, hs+off*2) for t in range(361)]
        draw.polygon(pts, fill=col)

    # Main gold heart
    pts = [heart_point(t*2*math.pi/360, cx, cy, hs) for t in range(361)]
    draw.polygon(pts, fill=(212, 175, 55))

    # Inner highlight overlay
    hi_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    hi_draw = ImageDraw.Draw(hi_img)
    hi_pts = [heart_point(t*2*math.pi/360, cx - int(hs*0.08), cy - int(hs*0.08), int(hs*0.52)) for t in range(361)]
    hi_draw.polygon(hi_pts, fill=(255, 230, 130, 90))
    base = img.convert('RGBA')
    base.alpha_composite(hi_img)
    img = base.convert('RGB')
    draw = ImageDraw.Draw(img)

    # Crescent inside top of heart
    mc_x, mc_y = cx, cy - int(hs * 0.18)
    mr = int(hs * 0.22)
    draw.ellipse([mc_x-mr, mc_y-mr, mc_x+mr, mc_y+mr], fill=(172, 132, 16))
    cut = int(mr * 0.78)
    offset = int(mr * 0.40)
    draw.ellipse([mc_x-cut+offset, mc_y-cut, mc_x+cut+offset, mc_y+cut], fill=(212, 175, 55))

    # Text fonts
    try:
        f_main = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(size * 0.108))
        f_pk   = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(size * 0.072))
        f_tag  = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(size * 0.037))
    except Exception:
        f_main = ImageFont.load_default()
        f_pk   = f_main
        f_tag  = f_main

    ty = cy + int(hs * 0.63)

    # "shadii" white text
    draw.text((cx, ty), "shadii", font=f_main, fill=(255, 255, 255), anchor="mm")
    bb = draw.textbbox((cx, ty), "shadii", font=f_main, anchor="mm")

    # ".pk" gold text right after
    draw.text((bb[2] + 6, ty), ".pk", font=f_pk, fill=(212, 175, 55), anchor="lm")

    if not for_adaptive:
        draw.text((cx, ty + int(size * 0.077)),
                  "Hamsafar: Aik Mukammal Zindagi Ka",
                  font=f_tag, fill=(212, 175, 55), anchor="mm")

    return img


icon = make_icon(1024)
icon.save('/Users/mac/my-apps/shadi-pk/mobile/assets/icon.png', 'PNG')

adap = make_icon(1024, for_adaptive=True)
adap.save('/Users/mac/my-apps/shadi-pk/mobile/assets/adaptive-icon.png', 'PNG')

icon.save('/Users/mac/my-apps/shadi-pk/mobile/assets/splash-icon.png', 'PNG')

print("Done! Icons saved.")
