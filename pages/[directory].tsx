import {useRouter} from 'next/router'
import MainPage from 'components/mainPage';
import {DisplayMode} from 'lib/mainPageContext';

// Current URL is '/'
function Index() {
    const router = useRouter()

    const {directory, mode} = router.query

    console.log(`Index '${directory}'`);
    if (typeof directory === 'string') {
        return <MainPage fileDirectory={directory as string} displayMode={mode as DisplayMode || 'def'}/>;
    } else {
        return null;
    }
}

export default Index