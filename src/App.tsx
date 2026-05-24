import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const WorkDetail = lazy(() => import("./components/WorkDetail"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
import { LoadingProvider } from "./context/LoadingProvider";
import ScrollToTop from "./components/utils/ScrollToTop";

const App = () => {
  return (
    <>
      <LoadingProvider>
        <ScrollToTop />
        <Suspense>
          <Routes>
            <Route path="/" element={
              <MainContainer>
                <Suspense>
                  <CharacterModel />
                </Suspense>
              </MainContainer>
            } />
            <Route path="/work-detail/:id" element={
              <Suspense fallback={<div>Loading...</div>}>
                <WorkDetail />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<div>Loading...</div>}>
                <AdminPanel />
              </Suspense>
            } />
          </Routes>
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;
