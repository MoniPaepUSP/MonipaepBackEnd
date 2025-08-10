import dayjs from 'dayjs'

export const refreshTokenExpiresIn = () => {
  return dayjs().add(14, 'days').unix()
}