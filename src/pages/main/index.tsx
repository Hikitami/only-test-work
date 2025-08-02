import { Container, TimelineSlider } from "../../components"
import { timelineSlides } from "../../mock/slides"
import classes from './main.module.scss'

export const Main: React.FC = () => {
    return (
        <div className={classes.main}>
            <Container>
                <div className={classes.mainTitle}>
                    <h1 className={classes.title}>Исторические даты</h1>
                </div>
                <TimelineSlider timelineSlides={timelineSlides}/>
            </Container>
        </div>
    )
}