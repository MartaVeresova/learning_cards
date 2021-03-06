import React, {FC, memo, useEffect} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import './App.css';
import {Registration} from './components/auth/Registration';
import {Login} from './components/auth/Login';
import {ForgotPassword} from './components/auth/ForgotPassword';
import {Profile} from './components/profile/Profile';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStateType} from './bll/store';
import {initializeAppTC} from './bll/app-reducer';
import {CircularProgress} from '@material-ui/core';
import {NewPassword} from './components/auth/NewPassword';
import {PrivateRoute} from './features/privateRoute/PrivateRoute';
import {Error404} from './features/error404/Error404';
import {Header} from './components/header/Header';
import {Cards} from './components/main/cards/Cards';
import {PacksList} from './components/main/packsList/PacksList';


const App: FC = memo(() => {

    const dispatch = useDispatch();
    const isInitialized = useSelector<AppRootStateType, boolean>(state => state.app.isInitialized)
    const isLoggedIn = useSelector<AppRootStateType, boolean>(state => state.auth.isLoggedIn)

    useEffect(() => {
        dispatch(initializeAppTC())
    }, [dispatch])

    if (!isInitialized) {
        return <div
            style={{position: 'fixed', top: '40%', textAlign: 'center', width: '100%'}}>
            <CircularProgress/>
        </div>
    }

    return (
        <>
            <Header/>
            <div>
                <Switch>
                    <PrivateRoute exact path="/" isLoggedIn={isLoggedIn} render={() => <PacksList/>}
                                  redirectTo="/login"/>
                    <PrivateRoute exact path="/pack/:id" isLoggedIn={isLoggedIn} render={() => <Cards/>}
                                  redirectTo="/login"/>
                    <PrivateRoute path="/profile" isLoggedIn={isLoggedIn} render={() => <Profile/>}
                                  redirectTo="/login"/>
                    <PrivateRoute path="/login" isLoggedIn={!isLoggedIn} render={() => <Login/>}
                                  redirectTo="/"/>
                    <PrivateRoute path="/registration" isLoggedIn={!isLoggedIn} render={() => <Registration/>}
                                  redirectTo="/"/>

                    <Route exact path={'/changepassword'} render={() => <ForgotPassword/>}/>
                    <Route path={'/changepassword/newpassword/:token?'} render={() => <NewPassword/>}/>
                    <Route path={'/404'} render={() => <Error404/>}/>
                    <Redirect from={'*'} to={'/404'}/>
                </Switch>
            </div>
        </>
    )
})

export default App;