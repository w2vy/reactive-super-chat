import React from 'react'

function ChoiceTheme() {
    const [theme, setTheme] = React.useState("");
    const saveTheme = (theme: string) => {
        localStorage.setItem("theme", theme);
        setTheme(theme);
    }
  return (
    <div>
        <h1>You can choose your favorite theme</h1>
        <div className='theme_cards'>
            <div className='theme_card_dark' onClick={() => saveTheme("theme_card_dark")}>
                {theme === "theme_card_dark" ? <p>Theme selected!</p>:<p>Dark Theme</p>}
            </div>

            <div className='theme_card_light' onClick={() => saveTheme("theme_card_light")}>
                {theme === "theme_card_light" ? <p>Theme selected!</p>:<p>Light Theme</p>}
            </div>

            <div className='theme_card_blue' onClick={() => saveTheme("theme_card_blue")}>
                {theme === "theme_card_blue" ? <p>Theme selected!</p>:<p>Dark blue theme</p>}
            </div>
        </div>
    </div>
  )
}

export default ChoiceTheme