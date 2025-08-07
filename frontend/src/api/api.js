import axios from 'axios'

export const BASE_API_URL =
    process.env.NODE_ENV === 'production'
        ? '/api'
        : 'http://localhost:5001/api'

axios.defaults.headers.common['authorization'] = sessionStorage.getItem('token')

export default axios