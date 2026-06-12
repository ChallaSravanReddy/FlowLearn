import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { StudentPage } from './pages/StudentPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { ScalingPage } from './pages/ScalingPage';
import { ReplicationPage } from './pages/ReplicationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="builder" element={<BuilderPage />} />
          <Route path="student" element={<StudentPage />} />
          <Route path="student/course/:id" element={<CoursePlayerPage />} />
          <Route path="scaling" element={<ScalingPage />} />
          <Route path="replication" element={<ReplicationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
