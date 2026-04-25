import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-24">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 border-4 border-[#175bbd]/20 border-t-[#175bbd] rounded-full animate-spin"></div>
                    <p className="mt-4 text-[#2d3951]/70 font-medium">Checking authentication...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/auth" replace state={{ from: location }} />
    }

    return children
}

export default ProtectedRoute
