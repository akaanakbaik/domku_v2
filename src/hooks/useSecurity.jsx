import { useEffect } from 'react'

const useSecurity = () => {
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    const handleKeyDown = (e) => {
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    const title = 'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px black;'
    const subtitle = 'color: white; font-size: 16px; background: red; padding: 5px; border-radius: 5px;'

    console.log('%cSTOP!', title)
    console.log('%cWARNING: Accessing developer tools is restricted.', subtitle)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}

export default useSecurity