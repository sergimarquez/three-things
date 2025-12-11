import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Archive from './pages/Archive';
import Streak from './pages/Streak';
import Export from './pages/Export';
import Instructions from './pages/Instructions';
import YearReview from './pages/YearReview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="archive" element={<Archive />} />
          <Route path="streak" element={<Streak />} />
          <Route path="export" element={<Export />} />
          <Route path="instructions" element={<Instructions />} />
          <Route path="year-review" element={<YearReview />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
