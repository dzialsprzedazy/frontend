import { usePush, useNotivue } from 'notivue'

export function useAlerts() {
  const push = usePush()
  const config = useNotivue()

  const showAlert = ({ type = 'info', message, position = 'top-right', duration }) => {
    
    config.update({ position: position })

    const options = { message }
    if (duration) options.duration = duration

    if (type === 'success') {
      push.success(options)
    } else if (type === 'error') {
      push.error(options)
    } else if (type === 'warning') {
      push.warning(options)
    } else {
      push.info(options)
    }
  }

  return { showAlert }
}