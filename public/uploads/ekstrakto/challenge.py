#!/usr/bin/env python3
# PHXCTF - Cryptography challenge (Python)
# Goal: recover the flag and input it when prompted.
# Flag format: PHXCTF{PythonEkstarktor}

import sys
import struct

# Scrambled flag bytes (encrypted)
scrambled = [121, 104, 110, 194, 14, 166, 219, 2, 138, 235, 172, 110, 142, 91, 24, 86, 15, 245, 141, 198, 3, 19, 158, 142]

# LCG parameters (public)
a = 1664525
c = 1013904223
m = 4294967296

# Stored obfuscated seed (seed_secret XOR seed_magic)
stored_seed_obf = 340984913

# seed_magic kept here so reverse engineers can find relation, but you can obfuscate further if desired
seed_magic = 3405691582

def rol8(v, s):
    return ((v << s) & 0xFF) | (v >> (8 - s))

def build_keystream(length, seed):
    x = seed & 0xFFFFFFFF
    ks = []
    for i in range(length):
        x = (a * x + c) % m
        b = ((x >> 16) ^ (x & 0xFFFF)) & 0xFF
        r = (i % 7)
        b = rol8(b, r)
        ks.append(b)
    return ks

def reconstruct_flag():
    # reverse obfuscation to get seed
    seed = stored_seed_obf ^ seed_magic
    ks = build_keystream(len(scrambled), seed)
    flag_bytes = bytes([s ^ k for s, k in zip(scrambled, ks)])
    try:
        return flag_bytes.decode('utf-8')
    except:
        return None

def main():
    expected = reconstruct_flag()
    if expected is None:
        print("Error reconstructing flag.")
        return
    inp = input("Enter flag: ").strip()
    if inp == expected:
        print("Correct! Flag accepted.")
    else:
        print("Incorrect.")

if __name__ == '__main__':
    main()
