import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Archive from "./pages/Archive";
import Streak from "./pages/Streak";
import Export from "./pages/Export";
import Instructions from "./pages/Instructions";
import YearReview from "./pages/YearReview";
import MonthlyReviewPage from "./pages/MonthlyReviewPage";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              }
            />
            <Route
              path="archive"
              element={
                <ErrorBoundary>
                  <Archive />
                </ErrorBoundary>
              }
            />
            <Route
              path="streak"
              element={
                <ErrorBoundary>
                  <Streak />
                </ErrorBoundary>
              }
            />
            <Route
              path="export"
              element={
                <ErrorBoundary>
                  <Export />
                </ErrorBoundary>
              }
            />
            <Route
              path="instructions"
              element={
                <ErrorBoundary>
                  <Instructions />
                </ErrorBoundary>
              }
            />
            <Route
              path="year-review"
              element={
                <ErrorBoundary>
                  <YearReview />
                </ErrorBoundary>
              }
            />
            <Route
              path="monthly-review/:month"
              element={
                <ErrorBoundary>
                  <MonthlyReviewPage />
                </ErrorBoundary>
              }
            />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
