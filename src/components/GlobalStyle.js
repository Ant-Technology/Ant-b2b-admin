import React from 'react'
import { Global } from '@mantine/core';

const GlobalStyle = () => {
  return (
<Global
      styles={(theme) => ({
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },

        body: {
          ...theme.fn.fontStyles(),
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
          lineHeight: theme.lineHeight,
        },

        // '.your-class-ass': {
        //   backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black, 
        // },

        // '#your-id > [data-active]': {
        //   backgroundColor: 'pink'
        // }
      })}
    />  )
}

export default GlobalStyle