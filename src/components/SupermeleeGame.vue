<template>
  <div class="game">
    <div v-for="(team, index) in game" :key="team" v-show="team.team !== null">
      <div class="small"><span v-for="(p, pindex) in getTeam(team.team)">{{ p.name }}<span v-if="pindex < nbGroups - 1"> / </span></span></div>
      <select class="score" @change="update(index, $event)">
        <option v-for="value in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]" :value="value" v-html="value" :selected="team.score == value" :key="value"></option>
      </select>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    'game': { type: Array, required: true },
    'round': { type: Number, required: true },
    'index': { type: Number, required: true }
  },
  computed: {
    ...mapGetters({
      teams: 'supermeleeTeams',
      nbGroups: 'supermeleeNbGroups',
      players: 'allPlayers'
    })
  },
  methods: {
    getTeam (team) {
      return this.teams[this.round][team].map((id) => {
        return this.players.find(x => x.id === id)
      })
    },
    update (index, event) {
      if (parseInt(event.target.value) === 13 && this.game[Math.abs(index - 1)].score === 13) {
        this.$store.dispatch('updateSupermeleeGame', {
          round: this.round,
          game: this.index,
          index: Math.abs(index - 1),
          value: 0
        })
      }
      this.$store.dispatch('updateSupermeleeGame', {
        round: this.round,
        game: this.index,
        index: index,
        value: parseInt(event.target.value)
      })
    }
  }
}
</script>

<style scoped>
  .game {
    margin: 10px 0;
    padding: 3px;
    border: solid red 1px;
  }
  h5 {
    margin-bottom: 0;
    font-weight: bold;
  }
</style>
