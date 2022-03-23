import {useState} from 'react'
import Nav from "../components/Nav";
import {useCookies} from 'react-cookie'
import axios from "axios";
import {useNavigate} from 'react-router-dom'

const OnBoarding = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

    const [formData, setFormData] = useState({
        user_id: cookies.UserId,
        first_name: '',
        db_day: '',
        db_month: '',
        db_year: '',
        gender: 'man',
        gender_show: false,
        gender_interest: 'woman',
        avatar: '',
        about: '',
        matches: []
    })

    let navigate = useNavigate()

    const handleChange = (e) => {
        console.log('e', e)
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        const name = e.target.name

        setFormData((prevState => ({
            ...prevState,
            [name]: value
        })))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.put('http://localhost:8000/user', {formData})
            const success = response.status === 200

            if (success) {
                navigate('/dashboard')
            }
        } catch (e) {
            console.log(e)
        }
    }


    return (
        <>
            <Nav
                minimal={true}
                setShowModal={() => {
                }}
                showModal={false}
            >
            </Nav>
            <div className="onboarding">

                <h2>СОЗДАНИЕ АККАУНТА</h2>

                <form onSubmit={handleSubmit}>
                    <section>
                        <label htmlFor="first_name">Имя</label>
                        <input
                            id="first_name"
                            type="text"
                            name="first_name"
                            placeholder="Имя"
                            required={true}
                            value={formData.first_name}
                            onChange={handleChange}
                        />
                        <label>Дата рождения</label>
                        <div className="multiple-input-container">
                            <input
                                id="db_day"
                                type="number"
                                name="db_day"
                                placeholder="ДД"
                                required={true}
                                value={formData.db_day}
                                onChange={handleChange}
                            />
                            <input
                                id="db_month"
                                type="number"
                                name="db_month"
                                placeholder="ММ"
                                required={true}
                                value={formData.db_month}
                                onChange={handleChange}
                            />
                            <input
                                id="db_year"
                                type="number"
                                name="db_year"
                                placeholder="ГГГГ"
                                required={true}
                                value={formData.db_year}
                                onChange={handleChange}
                            />
                        </div>
                        <label>Пол</label>
                        <div className="multiple-input-container">
                            <input
                                id="man-gender-identity"
                                type="radio"
                                name="gender"
                                value="man"
                                onChange={handleChange}
                                checked={formData.gender === 'man'}
                            />
                            <label htmlFor="man-gender-identity">Мужской</label>
                            <input
                                id="woman-gender-identity"
                                type="radio"
                                name="gender"
                                value="woman"
                                onChange={handleChange}
                                checked={formData.gender === 'woman'}
                            />
                            <label htmlFor="woman-gender-identity">Женский</label>
                        </div>
                        <label htmlFor="gender-show">Показывать пол в профиле</label>
                        <input
                            id="gender-show"
                            type="checkbox"
                            name="gender_show"
                            onChange={handleChange}
                            checked={formData.gender_show}
                        />
                        <label>Показывать мне</label>
                        <div className="multiple-input-container">
                            <input
                                id="woman-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="woman"
                                onChange={handleChange}
                                checked={formData.gender_interest === 'woman'}
                            />
                            <label htmlFor="woman-gender-interest">Женщин</label>
                            <input
                                id="man-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="man"
                                onChange={handleChange}
                                checked={formData.gender_interest === 'man'}
                            />
                            <label htmlFor="man-gender-interest">Мужчин</label>
                            <input
                                id="everyone-gender-interest"
                                type="radio"
                                name="gender_interest"
                                value="everyone"
                                onChange={handleChange}
                                checked={formData.gender_interest === 'everyone'}
                            />
                            <label htmlFor="everyone-gender-interest">Всех</label>
                        </div>

                        <label htmlFor="about">О себе</label>
                        <input
                            id="about"
                            type="text"
                            name="about"
                            placeholder="Мне нравится..."
                            value={formData.about}
                            required={true}
                            onChange={handleChange}
                        />
                        <input type="submit"/>
                    </section>
                    <section>
                        <label htmlFor="avatar">Профиль</label>
                        <input
                            type="avatar"
                            name="avatar"
                            id="avatar"
                            value={formData.avatar}
                            onChange={handleChange}
                            required={true}
                        />
                        <div className="photo-container">
                            {formData.avatar && <img src={formData.avatar} alt="Предпросмотр фотографии профиля"/>}
                        </div>
                    </section>
                </form>
            </div>
        </>
    )
}

export default OnBoarding
