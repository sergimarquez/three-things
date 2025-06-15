import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Archive from './pages/Archive';
import Streak from './pages/Streak';
import Review from './pages/Review';
import Export from './pages/Export';
import Instructions from './pages/Instructions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="archive" element={<Archive />} />
          <Route path="streak" element={<Streak />} />
          <Route path="review" element={<Review />} />
          <Route path="export" element={<Export />} />
          <Route path="instructions" element={<Instructions />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
