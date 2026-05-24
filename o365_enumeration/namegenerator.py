import argparse
import sys

def generate_combinations(firstnames, lastnames, domains):
    combinations = []
    
    # Use a set to avoid duplicate results
    unique_results = set()
    
    for f in firstnames:
        for l in lastnames:
            if not f or not l:
                continue

            # Standard Corporate Iterations
            patterns = [
                f"{f}.{l}",           # john.doe
                f"{f}{l}",            # johndoe
                f"{f[0]}{l}",         # jdoe
                f"{f}{l[0]}",         # johnd
                f"{l}.{f}",           # doe.john
                f"{l}{f[0]}",         # doej
                f"{f[:3]}{l[:3]}",    # johdoe
                f"{f}_{l}",           # john_doe
            ]

            for d in domains:
                if not d: continue
                for pattern in patterns:
                    unique_results.add(f"{pattern}@{d}")

    return sorted(list(unique_results))

def parse_input_file(filepath):
    """Reads a file and parses names whether they are line-separated or comma-separated."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Split by comma first
            if ',' in content:
                parts = content.split(',')
            else:
                # Fallback to line-separated
                parts = content.splitlines()
            
            # Clean: strip whitespace and convert to lowercase
            return [p.strip().lower() for p in parts if p.strip()]
    except Exception as e:
        print(f"[-] Error reading {filepath}: {e}")
        return []

def main():
    parser = argparse.ArgumentParser(description="Generate AD username combinations from comma or line-separated lists.")
    parser.add_argument("-name", required=True, help="Path to text file with first names")
    parser.add_argument("-lastname", required=True, help="Path to text file with last names")
    parser.add_argument("-domain", required=True, help="Path to text file with domains (or a single domain string)")
    parser.add_argument("-o", "--output", help="Output file (optional, defaults to stdout)")

    args = parser.parse_args()

    # Parse names and lastnames using the new comma-aware function
    firstnames = parse_input_file(args.name)
    lastnames = parse_input_file(args.lastname)
    
    # Handle domain logic
    try:
        with open(args.domain, 'r', encoding='utf-8') as f:
            content = f.read()
            if ',' in content:
                domains = [d.strip().lower() for d in content.split(',') if d.strip()]
            else:
                domains = [d.strip().lower() for d in content.splitlines() if d.strip()]
    except FileNotFoundError:
        domains = [args.domain.strip().lower()]

    if not firstnames or not lastnames:
        print("[-] Error: Could not find valid names in the input files.")
        sys.exit(1)

    results = generate_combinations(firstnames, lastnames, domains)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            for item in results:
                f.write(f"{item}\n")
        print(f"[+] Successfully parsed comma-separated files.")
        print(f"[+] Generated {len(results)} combinations and saved to {args.output}")
    else:
        for item in results:
            print(item)

if __name__ == "__main__":
    main()