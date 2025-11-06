/**
 * @fileoverview 游戏配置文件
 * @desc 包含游戏的所有配置选项
 */
export const GameConfig = {
	board: {
		size: 9,
		rows: 3,
		cols: 3
	},
	players: {
		X: { symbol: 'X', color: '#f87171' },
		O: { symbol: 'O', color: '#60a5fa' }
	},
	rules: {
		maxLifetime: 4
	},
	ai: {
		populationSize: 2048,
		mutationRate: 0.1,
		tournamentSize: 5,
		elitismRate: 0.1,
		fitnessScore: {
			X: 0.1,  // First player (proactive) reward
			O: 5.0   // Second player (reactive) reward - higher to encourage defensive learning
		},
		training: {
			maxMovesPerGame: 500,
			silentBattleMaxMoves: 50
		},
		mutation: {
			gaussianMultiplier: 0.6,
			gaussianOffset: 0.3,
			evolvabilityRange: { min: 0.01, max: 1.0 },
			strengthRange: { min: 0.01, max: 2.0 }
		}
	},
	animation: {
		moveDuration: 400,
		winLineDuration: 800
	}
}
