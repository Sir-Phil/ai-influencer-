from PIL import Image, ImageDraw, ImageFont
import textwrap
import os

def get_macos_font(font_name, size):
    """Helper to find fonts on macOS system paths"""
    paths = [
        f"/System/Library/Fonts/Supplemental/{font_name}.ttf",
        f"/Library/Fonts/{font_name}.ttf",
        f"/System/Library/Fonts/{font_name}.ttc",
        "/System/Library/Fonts/Cache/AppleColorEmoji.ttc" # Added for emoji support
    ]
    for path in paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                continue
    return ImageFont.load_default()

def create_tiktok_card(text: str, filename: str, verdict: str = "True"):
    # TikTok 9:16 Canvas (1080x1920)
    width, height = 1080, 1920
    
    # Amaka AI Brand Colors
    colors = {
        "True": {"bg": "#059669", "accent": "#ffffff"},      # Emerald Green
        "False": {"bg": "#dc2626", "accent": "#ffffff"},     # Red
        "Misleading": {"bg": "#d97706", "accent": "#ffffff"} # Amber
    }
    # Ensure verdict matching is case-insensitive
    theme = colors.get(verdict.capitalize(), {"bg": "#1e293b", "accent": "#ffffff"})

    img = Image.new('RGB', (width, height), color=theme["bg"])
    draw = ImageDraw.Draw(img)

    # Load MacOS Specific Fonts
    font_h = get_macos_font("Arial Bold", 85)
    font_p = get_macos_font("Arial", 55)
    font_footer_sub = get_macos_font("Arial", 40)

    # 1. Branding Header
    draw.text((width/2, 200), "AMAKA AI", font=font_h, fill=theme["accent"], anchor="mm")
    draw.rectangle([150, 260, 930, 265], fill=theme["accent"])

    # 2. Verdict Badge - Locked position to prevent overlap
    badge_y_center = 415
    badge_text = f"VERDICT: {verdict.upper()}"
    draw.rectangle([200, 350, 880, 480], outline="white", width=8)
    draw.text((width/2, badge_y_center), badge_text, font=font_h, fill=theme["accent"], anchor="mm")

    # 3. Body Content - Pushed down to start at 600px
    # Using 'ma' (top-middle) anchor so text grows DOWNWARD from the start point
    wrapper = textwrap.TextWrapper(width=28) # Slightly wider for better space usage
    wrapped_text = wrapper.fill(text=text)
    
    body_start_y = 600 
    draw.multiline_text(
        (width/2, body_start_y), 
        wrapped_text, 
        font=font_p, 
        fill=theme["accent"], 
        anchor="ma", # Changed to 'ma' to ensure it starts below the box
        align="center", 
        spacing=40
    )

    # 4. Footer
    draw.text((width/2, 1650), "TRUTH MONITOR 2026", font=font_p, fill=theme["accent"], anchor="mm")
    draw.text((width/2, 1720), "@AmakaAIMissionControl", font=font_footer_sub, fill=theme["accent"], anchor="mm")

    # Save logic
    output_dir = "static/posts"
    os.makedirs(output_dir, exist_ok=True)
    file_path = f"{output_dir}/{filename}.png"
    img.save(file_path)
    
    return file_path