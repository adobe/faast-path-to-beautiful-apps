import React from 'react'
import Heading from '@react/react-spectrum/Heading'
import { Grid, GridRow, GridColumn } from '@react/react-spectrum/Grid'
import Textfield from '@react/react-spectrum/Textfield'
import Button from '@react/react-spectrum/Button'
import Action from '../services/Action'
import logo from '../../resources/adobe-logo.png'
import Alert from '@react/react-spectrum/Alert'

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      greeting: 'Hello there',
      name: '',
      errorMsg: ''
    }

    this.inputChange = this.inputChange.bind(this)
    this.hello = this.hello.bind(this)
  }

  inputChange (name) {
    this.setState({
      name
    })
  }

  async hello () {
    try {
      const json = await Action.webInvoke('hello', { name: this.state.name }, true)
      this.setState({
        greeting: json.message,
        errorMsg: ''
      })
    } catch (e) {
      this.setState({
        errorMsg: (e.status || 'Error') + ': ' + e.message
      })
    }
  }

  render () {
    return (
      <Grid>
        <GridRow align='center'>
          <GridColumn>
            <img src={logo} height='75px' />
          </GridColumn>
        </GridRow>

        <GridRow align='center'>
          <GridColumn>
            <Heading>{this.state.greeting}</Heading>
          </GridColumn>
        </GridRow>

        <GridRow align='center'>
          <GridColumn>
            <div style={{
              width: '268px',
              margin: '20px auto'
            }}>
              <Textfield onChange={this.inputChange} value={this.state.name} placeholder='Text here' />
              <br />
              <br />
              <Button onClick={this.hello} variant='primary'>Greet</Button>
            </div>
          </GridColumn>
        </GridRow>

        {this.state.errorMsg &&
          <GridRow align='center'>
            <Alert variant='error' header={this.state.errorMsg} />
          </GridRow>
        }

      </Grid>
    )
  }
}
