import React from 'react'
import {
  Animated,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  VrButton,
  Image,
  asset
} from 'react-360'

const rand = (a, b) => a + Math.floor(Math.random() * b)
let i = 0

function getNewTarget() {
  const target = {
    key: `t-${i++}`,
    animate: i > 10,
    fast: i > 40,
    faster: i > 40 ? i : 0,
    x: rand(0, 1024 - 128),
    y: rand(0, 1024 - 128),
    x2: rand(0, 1024 - 128),
    y2: rand(0, 1024 - 128)
  }
  const dist = Math.sqrt(
    Math.pow(target.x - target.x2, 2) + Math.pow(target.y - target.y2, 2)
  )
  if (dist < 400) {
    i--
    return getNewTarget()
  }
  return target
}

export default class asteroids extends React.Component {
  state = { gameOver: true, targets: [], score: -1 }

  startGame = () => {
    i = 0
    this.setState({ score: 0, targets: [getNewTarget()], gameOver: false })
    const intervalId = setInterval(() => {
      const targets = [...this.state.targets, getNewTarget()]
      if (targets.length > 20) {
        this.setState({ targets: [], gameOver: true })
        clearInterval(intervalId)
        return
      }
      this.setState({ targets })
    }, 1000)
  }

  handleClick = key => {
    const { score, targets } = this.state
    this.setState({
      score: score + 1,
      targets: targets.filter(t => t.key !== key)
    })
  }

  render() {
    return (
      <View style={styles.panel}>
        <View style={styles.greetingBox}>
          {this.state.score !== -1 && (
            <Text style={styles.greeting}>Score {this.state.score}.</Text>
          )}
          {this.state.gameOver && (
            <View>
              {this.state.score !== -1 && (
                <Text style={styles.greeting}>GAME OVER.</Text>
              )}
              <VrButton onClick={this.startGame}>
                <Text>Start Game</Text>
              </VrButton>
            </View>
          )}
        </View>
        {this.state.targets.map(t => (
          <Target {...t} onClick={() => this.handleClick(t.key)} />
        ))}
      </View>
    )
  }
}

class Target extends React.Component {
  state = {
    x: new Animated.Value(this.props.x),
    y: new Animated.Value(this.props.y)
  }

  componentDidMount() {
    const duration = (this.props.fast ? 1500 : 3000) - this.props.faster * 4
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.x, {
          toValue: this.props.animate ? this.props.x2 : this.props.x,
          duration
        }),
        Animated.timing(this.state.x, {
          toValue: this.props.x,
          duration
        })
      ]),
      { iterations: 100000 }
    ).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.y, {
          toValue: this.props.animate ? this.props.y2 : this.props.y,
          duration
        }),
        Animated.timing(this.state.y, {
          toValue: this.props.y,
          duration
        })
      ]),
      { iterations: 100000 }
    ).start()
  }

  render() {
    const { onClick } = this.props
    const { x, y } = this.state
    return (
      <Animated.View style={{ position: 'absolute', top: y, left: x }}>
        <VrButton onClick={onClick}>
          <Image source={asset('target.png')} style={styles.target} />
        </VrButton>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  panel: {
    // Fill the entire surface
    width: 1024,
    height: 1024,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  greetingBox: {
    padding: 20,
    backgroundColor: '#000000',
    borderColor: '#639dda',
    borderWidth: 2
  },
  target: {
    width: 128,
    height: 128
  },
  greeting: {
    fontSize: 30
  }
})

AppRegistry.registerComponent('asteroids', () => asteroids)
