import {useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {useCookies} from 'react-cookie'

const AuthModal = ({setShowModal, isSignUp, setIsSignUp}) => {

    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [error, setError] = useState(null)
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

    let navigate = useNavigate()

    const handleClick = () => {
        setShowModal(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (isSignUp && (password !== confirmPassword)) {
                setError("Пароли не совпадают!")
                return
            }
            const response = await axios.post(`http://localhost:8000/${isSignUp ? 'signup' : 'login'}`, {
                email,
                password
            })

            setCookie('AuthToken', response.data.token)
            setCookie('UserId', response.data.userId)

            const success = response.status === 201

            if (success && isSignUp) navigate('/onboarding')
            if (success && !isSignUp) navigate('/dashboard')

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="auth-modal">
            <div className="close-icon" onClick={handleClick}>⊗</div>
            <h2>{isSignUp ? 'СОЗДАТЬ АККАУНТ' : 'ВОЙТИ'}</h2>
            <p>
                Нажимая «Войти», вы принимаете наши <a
                className="C($c-secondary) focus-outline-style Fw($fw-ds-bold) Td(u) Td(n):h"
                href="https://policies.tinder.com/terms?lang=ru" target="_blank" data-testid="termsOfService"
                rel="noopener noreferrer" aria-describedby="open-in-new-window">Условия</a>. Чтобы узнать, как мы
                обрабатываем ваши данные, ознакомьтесь с нашей <a
                className="C($c-secondary) focus-outline-style Fw($fw-ds-bold) Td(u) Td(n):h"
                href="https://policies.tinder.com/privacy?lang=ru" target="_blank" data-testid="privacyPolicy"
                rel="noopener noreferrer" aria-describedby="open-in-new-window">Политика
                конфиденциальности</a> и <a
                className="C($c-secondary) focus-outline-style Fw($fw-ds-bold) Td(u) Td(n):h"
                href="https://policies.tinder.com/cookie-policy?lang=ru" target="_blank"
                data-testid="cookiePolicy" rel="noopener noreferrer" aria-describedby="open-in-new-window">Политика
                в отношении файлов Cookie</a>.
            </p>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Адрес электронной почты"
                    required={true}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Пароль"
                    required={true}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {isSignUp && <input
                    type="password"
                    id="password-сheck"
                    name="password-сheck"
                    placeholder="Подтверждение пароля"
                    required={true}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                }
                <input className="secondary-button" type="submit"/>
                <p>{error}</p>
            </form>
            <hr/>
            <h2>СКАЧАЙТЕ ПРИЛОЖЕНИЕ!</h2>
        </div>
    )
}

export default AuthModal
