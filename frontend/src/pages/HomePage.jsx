import Hero from '../components/Hero/Hero.jsx'
import Features from '../components/Features/Features.jsx'
import Categories from '../components/Categories/Categories.jsx'
import Advantages from '../components/Advantages/Advantages.jsx'
import About from '../components/About/About.jsx'
import Delivery from '../components/Delivery/Delivery.jsx'
import Reviews from '../components/Reviews/Reviews.jsx'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <Categories />
      <Advantages />
      <About />
      <Delivery />
      <Reviews />
    </main>
  )
}
