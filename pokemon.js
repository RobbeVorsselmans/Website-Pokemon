let app = new Vue({
  el: "#vue",
  name: "Pokemon",
  data() {
    return {
      id: 104,
      pokemon: null,
      chain: [],
      typeColours: {
        normal: "#A8A77A",
        fire: "#EE8130",
        water: "#6390F0",
        electric: "#F7D02C",
        grass: "#7AC74C",
        ice: "#96D9D6",
        fighting: "#C22E28",
        poison: "#A33EA1",
        ground: "#E2BF65",
        flying: "#A98FF3",
        psychic: "#F95587",
        bug: "#A6B91A",
        rock: "#B6A136",
        ghost: "#735797",
        dragon: "#6F35FC",
        dark: "#705746",
        steel: "#B7B7CE",
        fairy: "#D685AD",
      },
    };
  },
  computed: {
    name() {
      if (!this.pokemon) return;
      const name = this.pokemon.name;
      return this.capitalize(name) || "Onbekend";
    },
    types() {
      return this.pokemon && this.pokemon.types.map((t) => t.type.name);
    },
    type() {
      return (this.pokemon && this.types[0]) || "Onbekend";
    },
    height() {
      if (!this.pokemon) return;
      const dm = this.pokemon.height;
      let str = (dm / 10).toString();
      str = str.replaceAll(".", ",");
      str = str + " m";
      return str;
    },
    color() {
      return (this.pokemon && this.pokemon.color.name) || "Onbekend";
    },
    spriteUrl() {
      return (
        (this.pokemon &&
          this.pokemon.sprites.other.dream_world.front_default) ||
        ""
      );
    },
    moves() {
      if (!this.pokemon) return;
      let levelMoves = [];
      let allMoves = this.pokemon.moves;
      allMoves.forEach((move) => {
        const moveFr = move.version_group_details.find(
          (m) => m.version_group.name == "firered-leafgreen"
        );
        if (moveFr && moveFr.level_learned_at > 0) {
          levelMoves.push({
            level: moveFr.level_learned_at,
            name: move.move.name,
          });
        }
      });
      // opgave: eerste 5 aanvallen weergeven
      if (levelMoves.length < 5) {
        for (let i = levelMoves.length; i < 5; i++) {
          levelMoves.push({ level: 99, name: "Onbekend" });
        }
      }
      return levelMoves.sort((a, b) => a.level - b.level);
    },
    flavor() {
      if (!this.pokemon) return;
      let flavor = this.pokemon.flavor_text_entries.find(
        (fl) => fl.version.name == "firered" && fl.language.name == "en"
      );
      return (flavor && flavor.flavor_text) || "Geen info";
    },
    typeColor() {
      return this.typeColours[this.type] || "#777";
    },
  },
  methods: {
    async getPokemon(id) {
      id = Math.min(Math.max(1, id), 649);
      const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
      const res = await fetch(url);
      const pokemon = res.ok && (await res.json());
      console.log("Pokémon data:", pokemon);
      const urlSpec = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
      const resSpec = await fetch(urlSpec);
      const species = resSpec.ok && (await resSpec.json());
      this.pokemon = Object.assign(pokemon, species);
      this.id = id;
      this.chain = await this.getChain(pokemon);

      const card = document.querySelector(".card");
      card && card.style.setProperty("--card-bg", pokemon.color.name);
    },
    async getChain(pokemon) {
      const getIndex = (url) => {
        const numbers = url.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          return parseInt(numbers[numbers.length - 1]);
        }
        return null;
      };
      const chainUrl = pokemon.evolution_chain?.url;
      const resChain = await fetch(chainUrl);
      let chainObj = resChain.ok && (await resChain.json())?.chain;
      let id = getIndex(chainObj.species.url);
      const chain = [id];
      while (chainObj.evolves_to.length > 0) {
        // for necessary for eevee
        for (let i = 0; i < chainObj.evolves_to.length; i++) {
          evo = chainObj.evolves_to[i];
          chain.push(getIndex(evo.species.url));
        }
        chainObj = chainObj.evolves_to[0];
      }
      return chain.filter((id) => id <= 151);
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
    },
    getTypeColor(type) {
      return this.typeColours[type] || "#777";
    },
  },
  mounted() {
    this.getPokemon(this.id);
  },
});
