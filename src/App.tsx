import React from 'react';
import {QueryClient, QueryClientProvider} from "react-query";
import Video from "./Video";

const queryClient = new QueryClient()

function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <Video/>
        </QueryClientProvider>
    );
}

export default App;
