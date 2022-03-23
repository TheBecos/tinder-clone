import TinderCard from "react-tinder-card";
import {useEffect, useState} from 'react'
import {useCookies} from 'react-cookie'
import ChatContainer from '../components/ChatContainer'
import axios from "axios";

const Dashboard = () => {
    const [user, setUser] = useState(null)
    const [cookies, setCookie, removeCookie] = useCookies(['user'])
    const [genderedUsers, setGenderedUsers] = useState(null)
    const userId = cookies.UserId
    const getUser = async () => {
        try {
            const response = await axios.get('http://localhost:8000/user', {
                params: {userId}
            })
            setUser(response.data)
        } catch (e) {
            console.log(e)
        }
    }

    const getGenderedUsers = async () => {
        //console.log('curUser', user)
        try {
            const response = await axios.get('http://localhost:8000/gendered-users', {
                params: {gender: user?.gender_interest}
            })

            /*if (response.data) {
                Object.values(response.data).map((character) => {
                    console.log(character.first_name)
                })
            }*/
            setGenderedUsers(response.data)
        } catch (err) {
            console.log(err)
        }
    }


    useEffect(() => {
        getUser()
    }, [])

    useEffect(() => {
        if (user) {
            getGenderedUsers()
        }
    }, [user])

    const updateMatches = async (matchedUserId) => {
        try {
            await axios.put('http://localhost:8000/addmatch', {
                userId,
                matchedUserId
            })
            getUser()
        } catch (e) {
            console.log(e)
        }
    }

    const [lastDirection, setLastDirection] = useState()

    const swiped = (direction, swipedUserId) => {
        if (direction === 'right')
            updateMatches(swipedUserId)
        setLastDirection(direction)
    }

    const outOfFrame = (name) => {
        console.log(name + ' left the screen!')
    }

    const matchedUserIds = user?.matches.map(({user_id}) => user_id).concat(userId)
    const filteredGenderedUsers = genderedUsers?.filter(
        genderedUser => !matchedUserIds.includes(genderedUser.user_id)
    )

    return (
        <>
            {user && <div className="dashboard">
                <ChatContainer user={user}/>
                <div className="swipe-container">
                    <div className="card-container">
                        {
                            /*genderedUsers &&
                             Object.values(genderedUsers)?.map((genderedUser) =>*/
                            filteredGenderedUsers?.map((genderedUser) =>
                                <TinderCard className='swipe'
                                            key={genderedUser.user_id}
                                            onSwipe={(dir) => swiped(dir, genderedUser.user_id)}
                                            onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}>
                                    <div style={{backgroundImage: 'url(' + genderedUser.avatar + ')'}}
                                         className='card'
                                    >
                                        <h3>{genderedUser.first_name}</h3>
                                    </div>
                                </TinderCard>
                            )
                        }

                        <div className="swipe-info">
                            {lastDirection ? <p>Вы смахнули {lastDirection}</p> : <p/>}

                        </div>
                    </div>
                </div>
            </div>
            }
        </>
    )
}


export default Dashboard
