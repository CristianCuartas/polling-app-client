import React, {Component} from 'react';
import './App.css';
import {Route, withRouter, Switch} from 'react-router-dom';

import {getCurrentUser} from '../util/APIUtils';
import {ACCESS_TOKEN} from '../constants';

import LoadingIndicator from '../common/LoadingIndicator';
import AppHeader from './../common/AppHeader';
import PollList from './../poll/PollList';
import Login from '../user/login/Login';
import Signup from '../user/signup/Signup';
import Profile from '../user/profile/Profile';
import PrivateRoute from '../common/PrivateRoute';
import NewPoll from '../poll/NewPoll';
import NotFound from '../common/NotFound';

import {Layout, notification} from 'antd';
const {Content}= Layout;



class App extends Component {
  constructor(props){
    super(props);
    this.state={
      currentUser: null,
      isAuthenticated: false,
      isLoading: false
    }
    this.handleLogout = this.handleLogout.bind(this);
    this.loadCurrentUser = this.loadCurrentUser.bind(this);
    this.handleLogin = this.handleLogin.bind(this);

    notification.config({
      placement:'topRight',
      top:70,
      duration:3,
    });
  }
  loadCurrentUser(){
    this.setState({
      isLoading: true
    });
    getCurrentUser()  
    .then(response =>{this.setState({
      currentUser: response,
      isAuthenticated: true,
      isLoading: false
    });
  }).catch(error=>{
    this.setState({
      isLoading:false
    });
  });
  }
  componentDidMount(){
    this.loadCurrentUser();
  }
  
// Manejar cierre de sesión, establecer el usuario actual y el estado de autenticado que se pasará a otros componentes
 
handleLogout(redirectTo="/", notificationType="success", description="Has cerrado sesión con éxito."){
  localStorage.removeItem(ACCESS_TOKEN);

  this.setState({
    currentUser: null,
    isAuthenticated: false
  });

  this.props.history.push(redirectTo);

  notification[notificationType]({
    message: 'Polling App',
    description: description,
  });
}

/*Este componente es llamado por el componente de inicio de sesión después de iniciar sesión correctamente
  para que podamos cargar los detalles del usuario que inició sesión y establecer el estado actual de usuario y autenticado, 
  que otros componentes utilizarán para representar su JSX*/

  handleLogin(){
    notification.success({
      message:'Polling App',
      description: "Has iniciado sesión con éxito."
    });
    this.loadCurrentUser();
    this.props.history.push("/");
  }

  render(){
    if(this.state.isLoading){
      return <LoadingIndicator/>
    }

    return (
      <Layout className="app-container">
      <AppHeader isAuthenticated={this.state.isAuthenticated}
        currentUser={this.state.currentUser}
        onLogout={this.handleLogout}/>

        <Content className="app-content">
          <div className="container">
            <Switch>
              <Route exact path="/"
                render={(props)=> <PollList isAuthenticated={this.state.isAuthenticated}
                    currentUser={this.state.currentUser} handleLogout={this.handleLogout}{...props}/>}>
              </Route>
              <Route path="/login"
                render={(props)=><Login onLogin={this.handleLogin}{...props}/>}>
                </Route>
              <Route path="/signup" component={Signup}></Route>
              <Route path="/user/:username"
                render={(props)=> <Profile isAuthenticated={this.state.isAuthenticated} currentUser={this.state.currentUser}{...props}/>}>
                </Route>
                <PrivateRoute authenticated={this.state.isAuthenticated} path="/poll/new" component={NewPoll} handleLogout={this.handleLogout}>
                </PrivateRoute>
                <Route component={NotFound}></Route>
            </Switch>
          </div>
        </Content>
      </Layout>
  );}
  
}

export default withRouter(App);

