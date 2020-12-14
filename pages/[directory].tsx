import {useRouter} from 'next/router'
import Page from 'components/page';

// Current URL is '/'
function Index() {
    const router = useRouter()

    const {directory} = router.query

    console.log(`Index '${directory}'`);
    if (typeof directory === 'string') {
        return <Page fileDirectory={directory as string}/>;
    } else {
        return null;
    }
}

export default Index