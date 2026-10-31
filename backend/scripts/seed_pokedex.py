import asyncio
import sys
import argparse
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import check_connection
from app.services.ingestion import ingest_pokemon_range, get_ingestion_status

async def main():
    parser = argparse.ArgumentParser(description="Seed DexMind Pokédex data from PokéAPI into MongoDB Atlas")
    parser.add_argument("--start", type=int, default=1, help="Starting Pokémon ID (default: 1)")
    parser.add_argument("--end", type=int, default=151, help="Ending Pokémon ID (default: 151)")
    args = parser.parse_args()

    print("========================================")
    print(" DexMind Pokédex Ingestion Pipeline ")
    print("========================================")

    # 1. Check MongoDB connectivity
    conn = check_connection()
    if not conn["connected"]:
        print(f"❌ Error: Cannot connect to MongoDB Atlas.")
        print(f"   Reason: {conn.get('error')}")
        print("   Please check your MONGODB_URI in backend/.env")
        sys.exit(1)

    print(f"✅ Connected to MongoDB Atlas database '{conn['database']}'.")
    print(f"Starting ingestion for Pokémon #{args.start} to #{args.end}...")

    # Start ingestion
    task = asyncio.create_task(ingest_pokemon_range(args.start, args.end))

    # Monitor progress
    while not task.done():
        st = get_ingestion_status()
        prog = st["progress"]
        tot = st["total"]
        curr = st["current_pokemon"]
        if tot > 0:
            pct = int((prog / tot) * 100)
            print(f"\rProgress: [{prog}/{tot}] {pct}% | Ingesting: {curr:<15}", end="", flush=True)
        await asyncio.sleep(1)

    await task
    st = get_ingestion_status()
    if st["error"]:
        print(f"\n❌ Ingestion encountered an error: {st['error']}")
        sys.exit(1)
    else:
        print(f"\n✅ Ingestion complete!")
        print(f"   Total Pokémon indexed: {st['stats']['pokemon_indexed']}")
        print(f"   Total RAG chunks indexed: {st['stats']['chunks_indexed']}")
        print(f"   Total source documents: {st['stats']['source_docs_indexed']}")

if __name__ == "__main__":
    asyncio.run(main())
