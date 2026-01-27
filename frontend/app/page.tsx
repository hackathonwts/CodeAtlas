import { Container, Heading, Text } from '@radix-ui/themes';

export default function Home() {
    return (
        <div>
            <Container size="3">
                <Heading size="4">Welcome to the Home Page</Heading>
                <Text>This is a sample Next.js application using Radix UI components.</Text>
            </Container>
        </div>
    );
}
