import dayjs from 'dayjs'

export const refreshTokenExpiresIn = () => {
  return dayjs().add(24, 'hours').unix()
}
