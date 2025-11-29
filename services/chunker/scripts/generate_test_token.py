#!/usr/bin/env python3
"""
Generate a local HS256 test token for the chunker service.

Usage:
  CHUNKER_SECRET=devsecret python generate_test_token.py --uid alice --role teacher

This token is only for local testing and is not suitable for production.
"""
import os
import jwt
import argparse


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--uid', default='test', help='User id')
    parser.add_argument('--role', default='teacher', help='Role claim (student|teacher|admin)')
    args = parser.parse_args()

    secret = os.getenv('CHUNKER_SECRET', 'devsecret')
    payload = {'uid': args.uid, 'role': args.role}
    token = jwt.encode(payload, secret, algorithm='HS256')
    print(token)


if __name__ == '__main__':
    main()
