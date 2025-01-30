import React from 'react'
import { Button } from '@mui/material'
import toast, { Toaster } from 'react-hot-toast';

export default function Test() {


    const showToast = () => {

        toast(
            (t) => (
                <span>
                    Custom and <b>bold</b>
                    <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
                </span>
            ),
            {
                // icon: <Icon />,
                duration: Infinity
            }
        );

        // toast('Hello World', {
        //     // duration: 4000,
        //     position: 'top-center',

        //     // Styling
        //     style: {},
        //     className: '',

        //     // Custom Icon
        //     icon: '👏',

        //     // Change colors of success/error/loading icon
        //     iconTheme: {
        //         primary: '#000',
        //         secondary: '#fff',
        //     },

        //     // Aria
        //     ariaProps: {
        //         role: 'status',
        //         'aria-live': 'polite',
        //     },
        // });
    }
    return (
        <div style={{ border: "3px solid red", color: "#000" }}>
            <Button variant="contained" onClick={showToast}>Toast</Button>
            <Toaster />
        </div>
    )
}
