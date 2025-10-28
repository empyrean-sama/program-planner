import { useContext } from 'react';
import { appGlobalStateContext } from '../components/App/AppGlobalStateProvider';
import IAppGlobalStateContextAPI from '../interface/IAppGlobalStateContextAPI';

export default function useAppGlobalState(): IAppGlobalStateContextAPI {
    const context = useContext(appGlobalStateContext);
    
    if (!context) {
        throw new Error('useAppGlobalState must be used within AppGlobalStateProvider');
    }
    
    return context;
}
