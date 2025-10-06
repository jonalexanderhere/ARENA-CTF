import base64

# Fungsi decode
def rev(s):
    return s[::-1]

def b64_dec(s):
    return base64.b64decode(s).decode('utf-8')

# String encoded
hidden = "TEVTTVNFUl9GVENTWFhQ=="

# Main logic
if __name__ == "__main__":
    dec = b64_dec(hidden)  # Layer 2: base64 decode
    dec = rev(dec)  # Layer 1: reverse
    user_input = input("Enter the flag: ")
    if user_input == dec:
        print("Correct!")
    else:
        print("Wrong! Try reverse engineering the code.")