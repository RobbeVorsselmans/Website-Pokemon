let app = new Vue({
    el: '#vue',
    name: "Pokemon",
    data() {
        return {
            id: 104,
            pokemon: null
        }
    },
    computed: {
        name() {
            if (!this.pokemon) return
            const name = this.pokemon.name;
            return this.capitalize(name) || 'Onbekend'
        },
        types() {
            return this.pokemon && this.pokemon.types.map(t => t.type.name)
        },
        type() {
            return this.pokemon && this.types[0] || 'Onbekend'
        },
        height() {
            if (!this.pokemon) return
            const dm = this.pokemon.height
            let str = (dm / 10).toString()
            str = str.replaceAll(".", ",");
            str = str + " m"
            return str
        },
        color() {
            return this.pokemon && this.pokemon.color.name || 'Onbekend'
        },
        spriteUrl() {
            return this.pokemon && this.pokemon.sprites.other.dream_world.front_default || ""
        },
        moves() {
            if (!this.pokemon) return
            let levelMoves = []
            let allMoves = this.pokemon.moves
            allMoves.forEach(move => {
                const moveFr = move.version_group_details.find(m => m.version_group.name == "firered-leafgreen")
                if (moveFr && moveFr.level_learned_at > 0) {
                    levelMoves.push({ level: moveFr.level_learned_at, name: move.move.name })
                }
            });
            // opgave: eerste 5 aanvallen weergeven
            if (levelMoves.length < 5) {
                for (let i = levelMoves.length; i < 5; i++) {
                    levelMoves.push({ level: 99, name: "Onbekend" })
                }
            }
            return levelMoves.sort((a, b) => a.level - b.level)
        },
        flavor() {
            if (!this.pokemon) return
            let flavor = this.pokemon.flavor_text_entries.find(fl => fl.version.name == "firered" && fl.language.name == "en")
            return flavor && flavor.flavor_text || "Geen info"
        }
    },
    methods: {
        async getPokemon(id) {
            id = Math.min(Math.max(1, id), 649)
            const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
            const res = await fetch(url)
            const pokemon = res.ok && await res.json()
            console.log('Pokémon data (p):', pokemon);
            const urlSpec = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
            const resSpec = await fetch(urlSpec)
            const species = resSpec.ok && await resSpec.json()
            this.pokemon = Object.assign(pokemon, species);
            this.id = id;

            const card = document.querySelector('.card')
            card && card.style.setProperty('--card-bg', pokemon.color.name)
        },
        capitalize(word) {
            return word && word[0].toUpperCase() + word.slice(1);
        },
        next() {
            this.id++;
            this.getPokemon(this.id);
        },
        prev() {
            this.id--;
            this.getPokemon(this.id);
        }
    },
    mounted() {
        this.getPokemon(this.id)
    }
})