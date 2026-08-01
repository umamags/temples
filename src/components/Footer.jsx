export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Mahesh Natarajan</p>
        <nav className="footer-links">
          <a href="https://umamags.github.io/quiz-app/" target="_blank" rel="noopener noreferrer">
            Quiz App
          </a>
          <a href="https://umamags.github.io/trains/" target="_blank" rel="noopener noreferrer">
            Trains
          </a>
          <a href="https://umamags.github.io/countries/" target="_blank" rel="noopener noreferrer">
            Countries
          </a>
          <a href="https://umamags.github.io/temples/" target="_blank" rel="noopener noreferrer">
            Temples
          </a>
        </nav>
      </div>
    </footer>
  )
}
