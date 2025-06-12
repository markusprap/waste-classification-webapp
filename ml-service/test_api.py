import requests
import argparse
import os
from pprint import pprint

def test_classification_api(image_path, api_url="http://localhost:5000/api/classify", lang="en"):
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return
    
    with open(image_path, 'rb') as image_file:
        files = {'image': (os.path.basename(image_path), image_file, 'image/jpeg')}
        params = {'lang': lang}
        
        print(f"Sending image {os.path.basename(image_path)} to {api_url}")
        response = requests.post(api_url, files=files, params=params)
    
    if response.status_code == 200:
        result = response.json()
        print("\nClassification successful! ✅")
        print("\nAPI Response:")
        pprint(result)
        
        if result.get('success'):
            data = result.get('data', {})
            print(f"\nSubcategory: {data.get('subcategory', 'N/A')}")
            print(f"Main Category: {data.get('main_category', 'N/A')}")
            print(f"Confidence: {data.get('confidence', 0):.4f}")
        else:
            print(f"\nError: {result.get('error', 'Unknown error')}")
    else:
        print(f"\nError: API request failed with status code {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test the waste classification API")
    parser.add_argument("image_path", help="Path to the image file to classify")
    parser.add_argument("--url", default="http://localhost:5000/api/classify", 
                        help="URL of the classification API endpoint")
    parser.add_argument("--lang", default="en", choices=["en", "id"], 
                        help="Language for the response (en/id)")
    
    args = parser.parse_args()
    test_classification_api(args.image_path, args.url, args.lang)
