import {useRouter} from 'next/router'
import MainPage from 'components/mainPage';

// Current URL is '/'
function Index() {
    const router = useRouter()

    const {directory, xmas} = router.query

    console.log(`Index '${directory}'`);
    if (typeof directory === 'string') {
        return <MainPage fileDirectory={directory as string} xmasMode={xmas != undefined}/>;
    } else {
        return null;
    }
}

export default Index