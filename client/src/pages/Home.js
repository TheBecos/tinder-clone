import Nav from '../components/Nav'
import AuthModal from '../components/AuthModal'
import {useState} from 'react'
import {useCookies} from "react-cookie"

const Home = () => {

    const [showModal, setShowModal] = useState(false)
    const [isSignUp, setIsSignUp] = useState(true)
    const [cookies, setCookie, removeCookie] = useState(['user'])

    const authToken = cookies.AuthToken

    const handleClick = () => {

        if(authToken){
            removeCookie('UserId', cookies.UserId)
            removeCookie('AuthToken', cookies.AuthToken)
            window.location.reload()
            return
        }

        setShowModal(true)
        setIsSignUp(true)
    }

    return (
        <div className="overlay">
            <Nav minimal={false}
                 authToken={authToken}
                 setShowModal={setShowModal}
                 showModal={showModal}
                 setIsSignUp={setIsSignUp}
            />
            <div className="home">
                <h1 className="primary-title">Свайп вправо®</h1>
                <button className="primary-button" onClick={handleClick}>
                    {authToken ? 'Выход' : 'Создать аккаунт'}
                </button>

                {showModal && (
                    <AuthModal setShowModal={setShowModal} setIsSignUp={setIsSignUp} isSignUp={isSignUp}/>
                )}

            </div>
        </div>
    )
}

export default Home
