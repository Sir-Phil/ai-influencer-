# verify_graphics.py
from app.utils.graphics import create_tiktok_card
import os

def run_test():
    test_content = (
        "BREAKING: The Port Harcourt refinery is now fully operational. "
        "Independent verification confirms petrol loading has commenced for "
        "local distribution across Rivers State."
    )
    
    print("🎨 Generating Amaka AI TikTok Card...")
    
    # Test all three states
    for v in ["True", "False", "Misleading"]:
        path = create_tiktok_card(test_content, f"test_tiktok_{v}", verdict=v)
        print(f"✅ Created {v} card at: {os.path.abspath(path)}")

if __name__ == "__main__":
    run_test()