// import consolante from '../../api/consolante'
// import * as types from '../mutation-types'

// initial state
// const state =
const state = JSON.parse(window.localStorage.getItem('playtanque_consolante')) ||
  {
    'ready': false,
    'nbTeams': 4,
    'nbPlayers': 3,
    'teams': [],
    'tournaments': []
  }

// getters
const getters = {
  ready: state => state.ready,
  consolante: state => state,
  allTeams: state => state.teams,
  tournaments: state => state.tournaments,
  findTeam: state => (tournament, round, teamId) => {
    for (let i = state.tournaments[tournament][round].length - 1; i >= 0; i--) {
      if (typeof state.tournaments[tournament][round][i] !== 'undefined') {
        for (let j = state.tournaments[tournament][round][i].length - 1; j >= 0; j--) {
          if (state.tournaments[tournament][round][i][j].team === teamId) {
            return {
              game: i,
              index: j
            }
          }
        }
      }
    }
    return false
  }
}

// actions
const actions = {
  changePlayerTeam ({ state, commit }, { oldTeamIndex, oldPlayerIndex, newTeamIndex, newPlayerIndex }) {
    commit('addPlayerToTeam', {
      team: newTeamIndex,
      player: state.teams[oldTeamIndex][oldPlayerIndex],
      index: newPlayerIndex
    })
    commit('removeFromTeam', {
      team: state.teams[oldTeamIndex],
      begin: oldPlayerIndex,
      end: 1
    })
  },

  initTournament ({ state, commit }) {
    var tournaments = []
    let nbTournament = 2
    for (let i = 0; i < nbTournament; i++) {
      if (typeof tournaments[i] === 'undefined') {
        tournaments[i] = [] // rounds
      }
      let nbTours = (Math.log(state.nbTeams) / Math.log(2)) / Math.pow(2, i)
      for (let j = 0; j < nbTours; j++) {
        if (typeof tournaments[i][j] === 'undefined') {
          tournaments[i][j] = [] // games
        }
        let nbGames = state.nbTeams / Math.pow(2, j + 1)
        for (let k = 0; k < nbGames; k++) {
          if (typeof tournaments[i][j][k] === 'undefined') {
            tournaments[i][j][k] = [
              {team: null, score: null}, // team 1
              {team: null, score: null} // team 2
            ]
          }
        }
      }
    }
    // tour 1
    for (let i = 0; i < state.nbTeams; i++) {
      let j = parseInt(i / 2)
      tournaments[0][0][j][i % 2] = {team: i, score: 0}
    }
    commit('setTournaments', tournaments)
  },

  updateGame ({ state, commit, dispatch }, { tournament, round, game, index, value }) {
    commit('updateGame', {
      game: state.tournaments[tournament][round][game][index],
      value: value
    })

    if (value === 13) { // win game, qualify team
      if (state.tournaments[tournament][round][game][Math.abs(index - 1)].score === 13) { // the other can't win too
        commit('updateGame', {
          game: state.tournaments[tournament][round][game][Math.abs(index - 1)],
          value: 0
        })
        dispatch('disqualify', {
          tournament: tournament,
          round: round + 1,
          teamId: state.tournaments[tournament][round][game][Math.abs(index - 1)].team
        })
      }

      commit('win', {
        tournament: tournament,
        round: round,
        game: game,
        teamId: state.tournaments[tournament][round][game][index].team
      })
    } else { // lose game, disqualify team
      dispatch('disqualify', {
        tournament: tournament,
        round: round + 1,
        teamId: state.tournaments[tournament][round][game][index].team
      })
    }
  },

  disqualify ({ state, commit, getters }, { tournament, round, teamId }) {
    if (round !== state.tournaments[tournament].length) {
      let ret = getters.findTeam(tournament, round, teamId)
      if (ret !== false) {
        commit('removeTeamFromGame', {
          tournament: tournament,
          round: round,
          game: ret.game,
          index: ret.index
        })
      }
    }
  }
}

const mutations = {
  setConsolante (state, {key, value}) {
    state[key] = value
  },

  setTeams (state, teams) {
    state.teams = teams.map((team) => {
      return team.map((player) => {
        return player.id
      })
    })
  },

  setTournaments (state, tournaments) {
    state.tournaments = tournaments
  },

  addTeam (state) {
    state.teams.push([])
  },

  deleteTeam (state, index) {
    if (index >= 0) {
      state.teams.splice(index, 1)
    } else {
      state.teams.splice(-1, 1)
    }
  },

  removeFromTeam (state, { team, begin, end }) {
    if (typeof end !== 'undefined') {
      team.splice(begin, end)
    } else {
      team.splice(begin)
    }
  },

  addPlayerToTeam (state, { team, player, index }) {
    if (index >= 0) {
      state.teams[team].splice(index, 0, player)
    } else {
      state.teams[team].push(player)
    }
  },

  removePlayer (state, player) {
    var tmp = []
    for (var i = 0; i < state.nbTeams; i++) {
      tmp[i] = state.teams[i].filter(p => p !== player)
    }
    state.teams = tmp
  },

  movePlayer (state, { team, oldIndex, newIndex }) {
    const movedItem = state.teams[team].splice(oldIndex, 1)[0]
    state.teams[team].splice(newIndex, 0, movedItem)
  },

  updateGame (state, { game, value }) {
    Object.assign(game, {score: value})
  },

  win (state, { tournament, round, game, teamId }) {
    if (round + 1 !== state.tournaments[tournament].length) { // qualify if not final round
      state.tournaments[tournament][round + 1][parseInt(game / 2)].push({team: teamId, score: 0})
    }
  },

  removeTeamFromGame (state, { tournament, round, game, index }) { // disqualify
    state.tournaments[tournament][round][game].splice(index)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
