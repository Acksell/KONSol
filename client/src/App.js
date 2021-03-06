import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import './App.css';
import Slide from './components/Slide.js'
import Alert from './components/Alert.js'
import Tags from './components/Tags.js'
import Cookies from 'js-cookie'

const blankSlide = {tags: [], url: '', start: '',end: '', visible: false, fullscreen: false, caption:'', imageFile:null}

const randomId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


class App extends Component {
  constructor() {
    super()
    this.state={
      user:{logged_in:false},
      slides:[],
      alerts:[]
    }
    this.addSlide.bind(this)
    this.removeSlide.bind(this)
    this.addAlert.bind(this)
    this.removeAlert.bind(this)

    fetch('api/me')
      .then(res=>res.json())
      .then(response => {
          if (response.ok) {
            this.setState({user:{logged_in:true,name:response.name,info:response.info}})
          }
          else {
            this.setState({user:{logged_in:false}})
          }
      })
      .catch(err => this.setState({user:{logged_in:false}}))
  }

  componentDidMount() {
    fetch('/api/screen/slides')
      .then(res =>  {
        if (res.ok || res.status === 304) {
          return res.json()
        }
        else {
          this.addAlert({type:"error", message:"Error: Could not load slides"}) 
          return []
        }
      })
      .then(slides => this.setState((prevstate) => {
        return { slides : prevstate.slides.concat(slides) }
      }))
  }

  addSlide = (slide) => {
    this.setState(prevState => {
      return { slides: [slide].concat(prevState.slides) }
    })
  }

  removeSlide = (id) => {
    this.setState(prevState => {
      return { slides: prevState.slides.filter(slide => slide._id !== id) }
    })
  }

  addAlert = (alert) => {
    this.setState(prevState => {
      return {alerts: prevState.alerts.concat({...alert, _id: randomId()})}
    })
  }

  removeAlert = (id) => {
    this.setState(prevState => {
      return {alerts: prevState.alerts.filter(alert => alert._id !== id)}
    })
  }

  render() {
    return (
      <div className="App">
        <div className="greeting">
          <h1>KONSol</h1>
          <p>Fjärrkontrollera skärmen i Konsulatet!</p>
          <Tags addAlert={this.addAlert} csrftoken={Cookies.get('XSRF-TOKEN')}/>
          <div className="greeting-buttons">
            { this.state.user.logged_in 
              ? <p>Welcome {this.state.user.name}!</p> 
              : <a href='http://localhost:8888/login?returnTo=http://localhost:8888' className="btn">Logga in med KTH</a>}
            <a href='http://localhost:8888/instagram' className="btn">Hämta nya Instagram-bilder</a>
          </div>
        </div>
        <div className="slides">
          <Slide initialState={blankSlide} addSlide={this.addSlide} addAlert={this.addAlert} csrftoken={Cookies.get('XSRF-TOKEN')}/>
          {/*key is a unique key for React to optimise rerendering*/}
          {this.state.slides.length
              ? this.state.slides.slice(0).sort((a,b) => (b.created-a.created))
                .map(slide =>
                  <Slide initialState={slide} csrftoken={Cookies.get('XSRF-TOKEN')} 
                      key={slide._id} removeSlide={this.removeSlide} addAlert={this.addAlert}/>
                )
              : null
          }
        </div>
        <div className="alerts">
          <TransitionGroup>
            {this.state.alerts.map(alert => 
              <CSSTransition classNames="alertTransition" key={alert._id} timeout={{ enter: 500, exit: 300 }}>
                <Alert {...alert} handleRemove={this.removeAlert}/>
              </CSSTransition>
            )}
          </TransitionGroup>
        </div>
      </div>
    );
  }
}

export default App;
