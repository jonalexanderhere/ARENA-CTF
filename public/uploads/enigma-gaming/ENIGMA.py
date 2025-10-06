import base64

def layer1_decode(data):
    return base64.b64decode(data).decode()

def layer2_decode(data):
    return data[::-1]

encoded = "SU1FVFRFS19BSEFIQVl7RlRDWUhQfQ=="
step1 = layer1_decode(encoded)
step2 = layer2_decode(step1)

if __name__ == "__main__":
    print("No flag here, try harder!")